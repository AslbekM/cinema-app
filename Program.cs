using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

var builder = WebApplication.CreateBuilder(args);

// When deployed to the cloud (Azure sets WEBSITE_SITE_NAME), let the host choose
// the port/binding. Locally, run on a fixed port for the one-click desktop launch.
var isCloud = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME"));
if (!isCloud)
{
    builder.WebHost.UseUrls("http://localhost:5095");
}

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDev", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<AppDb>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        // Azure SQL serverless auto-pauses when idle; retry transient failures
        // (including the ~30-60s "database waking up" window) instead of crashing.
        sql => sql.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(20),
            errorNumbersToAdd: null)));

builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;

    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;

    // Lock an account for 5 minutes after 5 failed login attempts (anti-brute-force).
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<AppDb>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/Login";

    // Return 401/403 for API requests instead of redirecting to login page
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseCors("ReactDev");
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Serve the React SPA. Redirect bare "/app" to the index file; the client-side
// catch-all route then lands the user on the home screen. (Redirecting to "/app/"
// instead would loop, since routing treats "/app" and "/app/" as the same route.)
app.MapGet("/app", () => Results.Redirect("/app/index.html"));
app.MapFallbackToFile("/app/{**slug}", "app/index.html");

// Apply any pending EF Core migrations on startup so a fresh cloud database
// builds all its tables automatically. No-op locally when already up to date.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    await db.Database.MigrateAsync();
}

await SeedData.CreateAdminAsync(app);
await SeedData.SeedScreeningsAsync(app);

// Auto-open the browser only for the local desktop launch, never on a server.
if (!isCloud)
{
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        Task.Delay(1000).ContinueWith(_ =>
            System.Diagnostics.Process.Start(
                new System.Diagnostics.ProcessStartInfo("http://localhost:5095/app") { UseShellExecute = true }));
    });
}

app.Run();
