using Microsoft.AspNetCore.Identity;
using tickets.Models;

namespace tickets.Data
{
    public static class SeedData
    {
        public static async Task CreateAdminAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();

            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

            string[] roles = { "Admin", "User" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            var adminNickname = "admin";
            var adminEmail = "admin@tickets.com";
            var adminPassword = "Admin123";

            var admin = await userManager.FindByNameAsync(adminNickname);

            if (admin == null)
            {
                admin = new AppUser
                {
                    UserName = adminNickname,
                    Email = adminEmail,
                    FirstName = "Main",
                    LastName = "Admin",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, adminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
}