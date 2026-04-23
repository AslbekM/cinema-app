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
        public DbSet<Seat> Seats { get; set; }
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

            modelBuilder.Entity<Seat>()
                .HasOne(s => s.Cinema)
                .WithMany(c => c.Seats)
                .HasForeignKey(s => s.CinemaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Seat>().HasData(GenerateSeatData());

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.ScreeningId, r.SeatId })
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

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Seat)
                .WithMany()
                .HasForeignKey(r => r.SeatId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private static Seat[] GenerateSeatData()
        {
            var seats = new List<Seat>();
            int id = 1;

            // Cinema 1: 5 rows × 8 seats
            for (int r = 1; r <= 5; r++)
                for (int s = 1; s <= 8; s++)
                    seats.Add(new Seat { Id = id++, CinemaId = 1, RowNumber = r, SeatNumber = s });

            // Cinema 2: 6 rows × 10 seats
            for (int r = 1; r <= 6; r++)
                for (int s = 1; s <= 10; s++)
                    seats.Add(new Seat { Id = id++, CinemaId = 2, RowNumber = r, SeatNumber = s });

            // Cinema 3: 7 rows × 12 seats
            for (int r = 1; r <= 7; r++)
                for (int s = 1; s <= 12; s++)
                    seats.Add(new Seat { Id = id++, CinemaId = 3, RowNumber = r, SeatNumber = s });

            return seats.ToArray();
        }
    }
}
