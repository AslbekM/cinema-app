using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tickets.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string FilmTitle { get; set; } = string.Empty;

        [Required]
        public string AppUserId { get; set; } = string.Empty;

        [ForeignKey(nameof(AppUserId))]
        public AppUser? AppUser { get; set; }

        [StringLength(256)]
        public string? UserName { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
