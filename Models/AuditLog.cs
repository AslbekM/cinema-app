using System.ComponentModel.DataAnnotations;

namespace tickets.Models
{
    /// <summary>An append-only record of a security-relevant action.</summary>
    public class AuditLog
    {
        public int Id { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [StringLength(450)]
        public string? UserId { get; set; }

        [StringLength(256)]
        public string? UserName { get; set; }

        [Required]
        [StringLength(100)]
        public string Action { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Details { get; set; }
    }
}
