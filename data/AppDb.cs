using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tickets.Models;

namespace tickets.Data
{
    public class AppDb : IdentityDbContext<AppUser>
    {
        public AppDb(DbContextOptions<AppDb> options) : base(options)
        {
        }

        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Screening> Screenings { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Cinema>().HasData(
                new Cinema { Id = 1, Name = "Cinema City", Rows = 5, SeatsPerRow = 8 },
                new Cinema { Id = 2, Name = "Helios", Rows = 6, SeatsPerRow = 10 },
                new Cinema { Id = 3, Name = "Multikino", Rows = 7, SeatsPerRow = 12 }
            );

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.ScreeningId, r.RowNumber, r.SeatNumber })
                .IsUnique();

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Screening)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.ScreeningId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.AppUser)
                .WithMany()
                .HasForeignKey(r => r.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}