using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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

        public static async Task SeedScreeningsAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDb>();

            // Cinema ids 1, 2, 3 are seeded via migrations (see AppDb.OnModelCreating).
            var today = DateTime.Today;

            var screenings = new List<Screening>
            {
                new() { FilmTitle = "Inception",                 CinemaId = 1, StartTime = today.AddDays(1).AddHours(18) },
                new() { FilmTitle = "The Dark Knight",           CinemaId = 2, StartTime = today.AddDays(1).AddHours(20).AddMinutes(30) },
                new() { FilmTitle = "Interstellar",              CinemaId = 3, StartTime = today.AddDays(2).AddHours(17) },
                new() { FilmTitle = "Dune: Part Two",            CinemaId = 1, StartTime = today.AddDays(2).AddHours(21) },
                new() { FilmTitle = "Oppenheimer",               CinemaId = 2, StartTime = today.AddDays(3).AddHours(19) },
                new() { FilmTitle = "Barbie",                    CinemaId = 3, StartTime = today.AddDays(3).AddHours(16).AddMinutes(30) },
                new() { FilmTitle = "The Matrix",                CinemaId = 1, StartTime = today.AddDays(4).AddHours(20) },
                new() { FilmTitle = "Pulp Fiction",              CinemaId = 2, StartTime = today.AddDays(4).AddHours(22) },
                new() { FilmTitle = "The Godfather",             CinemaId = 3, StartTime = today.AddDays(5).AddHours(18).AddMinutes(30) },
                new() { FilmTitle = "Forrest Gump",              CinemaId = 1, StartTime = today.AddDays(5).AddHours(17).AddMinutes(30) },
                new() { FilmTitle = "Gladiator",                 CinemaId = 2, StartTime = today.AddDays(6).AddHours(19).AddMinutes(30) },
                new() { FilmTitle = "Avatar: The Way of Water",  CinemaId = 3, StartTime = today.AddDays(6).AddHours(16) },
                new() { FilmTitle = "Joker",                     CinemaId = 1, StartTime = today.AddDays(7).AddHours(21).AddMinutes(15) },
                new() { FilmTitle = "Spider-Man: No Way Home",   CinemaId = 2, StartTime = today.AddDays(7).AddHours(18) },
                new() { FilmTitle = "Parasite",                  CinemaId = 3, StartTime = today.AddDays(8).AddHours(20).AddMinutes(45) },
            };

            // Add only the films that aren't already in the database (idempotent by title),
            // so this works whether the table is empty or already has other screenings.
            var existingTitles = await db.Screenings.Select(s => s.FilmTitle).ToListAsync();
            var toAdd = screenings.Where(s => !existingTitles.Contains(s.FilmTitle)).ToList();
            if (toAdd.Count == 0) return;

            db.Screenings.AddRange(toAdd);
            await db.SaveChangesAsync();
        }
    }
}