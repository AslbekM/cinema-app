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

        [Required]
        public int SeatId { get; set; }

        [ForeignKey(nameof(SeatId))]
        public Seat? Seat { get; set; }
    }
}
