using Microsoft.AspNetCore.Identity;
using tickets.Data;
using tickets.Models;

namespace tickets.Services
{
    public interface IAuditService
    {
        Task LogAsync(string action, string? details = null);
    }

    /// <summary>Writes append-only audit entries for the current user's actions.</summary>
    public class AuditService : IAuditService
    {
        private readonly AppDb _db;
        private readonly IHttpContextAccessor _http;
        private readonly UserManager<AppUser> _userManager;

        public AuditService(AppDb db, IHttpContextAccessor http, UserManager<AppUser> userManager)
        {
            _db = db;
            _http = http;
            _userManager = userManager;
        }

        public async Task LogAsync(string action, string? details = null)
        {
            var user = _http.HttpContext?.User;
            _db.AuditLogs.Add(new AuditLog
            {
                Timestamp = DateTime.UtcNow,
                UserId = user is not null ? _userManager.GetUserId(user) : null,
                UserName = user?.Identity?.Name,
                Action = action,
                Details = details is { Length: > 1000 } ? details[..1000] : details
            });
            await _db.SaveChangesAsync();
        }
    }
}
