using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using Xunit;

namespace tickets.Tests;

/// <summary>
/// Data-layer tests against a real (SQLite in-memory) database so constraints
/// like the unique seat index are actually enforced.
/// </summary>
public class DataTests
{
    private static AppDb NewDb(SqliteConnection conn)
    {
        var options = new DbContextOptionsBuilder<AppDb>().UseSqlite(conn).Options;
        var db = new AppDb(options);
        db.Database.EnsureCreated();
        return db;
    }

    private static AppUser AddUser(AppDb db)
    {
        var user = new AppUser
        {
            UserName = "tester",
            Email = "tester@example.com",
            FirstName = "Test",
            LastName = "User",
        };
        db.Users.Add(user);
        return user;
    }

    [Fact]
    public async Task BookingSameSeatTwice_IsRejected()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var db = NewDb(conn);

        var user = AddUser(db);
        var screening = new Screening { FilmTitle = "Test Film", StartTime = DateTime.Now.AddDays(1), CinemaId = 1 };
        db.Screenings.Add(screening);
        await db.SaveChangesAsync();

        db.Reservations.Add(new Reservation { ScreeningId = screening.Id, SeatId = 1, AppUserId = user.Id });
        await db.SaveChangesAsync();

        // Booking the exact same seat for the same screening must fail (unique index).
        db.Reservations.Add(new Reservation { ScreeningId = screening.Id, SeatId = 1, AppUserId = user.Id });
        await Assert.ThrowsAnyAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task FutureScreeningsQuery_ExcludesPastOnes()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var db = NewDb(conn);

        db.Screenings.Add(new Screening { FilmTitle = "Past", StartTime = DateTime.Now.AddDays(-1), CinemaId = 1 });
        db.Screenings.Add(new Screening { FilmTitle = "Future", StartTime = DateTime.Now.AddDays(1), CinemaId = 1 });
        await db.SaveChangesAsync();

        var now = DateTime.Now;
        var upcoming = await db.Screenings.Where(s => s.StartTime >= now).ToListAsync();

        Assert.Single(upcoming);
        Assert.Equal("Future", upcoming[0].FilmTitle);
    }

    [Fact]
    public async Task AuditLog_IsPersisted()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var db = NewDb(conn);

        db.AuditLogs.Add(new AuditLog { Action = "TestAction", Details = "details", UserName = "tester" });
        await db.SaveChangesAsync();

        var log = await db.AuditLogs.SingleAsync();
        Assert.Equal("TestAction", log.Action);
        Assert.Equal("tester", log.UserName);
    }

    [Fact]
    public void SeedData_CreatesCinemasAndSeats()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var db = NewDb(conn);

        // Cinemas + seats are seeded via the model (HasData).
        Assert.Equal(3, db.Cinemas.Count());
        Assert.True(db.Seats.Count() > 0);
    }
}
