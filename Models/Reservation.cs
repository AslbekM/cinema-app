using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tickets.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        [Required]
        public int ScreeningId { get; set; }

        [ForeignKey(nameof(ScreeningId))]
        public Screening? Screening { get; set; }

        [Required]
        public string AppUserId { get; set; } = string.Empty;

        [ForeignKey(nameof(AppUserId))]
        public AppUser? AppUser { get; set; }

        [Range(1, 100)]
        public int RowNumber { get; set; }

        [Range(1, 100)]
        public int SeatNumber { get; set; }
    }
}   