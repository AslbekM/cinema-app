using Microsoft.EntityFrameworkCore;
using tickets.Models;

namespace tickets.Data
{
    public class AppDb : DbContext
    {
        public AppDb(DbContextOptions<AppDb> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Screening> Screenings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Cinema>().HasData(
                new Cinema { Id = 1, Name = "Cinema City", Rows = 5, SeatsPerRow = 8 },
                new Cinema { Id = 2, Name = "Helios", Rows = 6, SeatsPerRow = 10 },
                new Cinema { Id = 3, Name = "Multikino", Rows = 7, SeatsPerRow = 12 }
            );
        }
    }
}