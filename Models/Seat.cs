using System.ComponentModel.DataAnnotations;

namespace tickets.Models
{
    public class Seat
    {
        public int Id { get; set; }

        [Required]
        public int CinemaId { get; set; }

        public Cinema? Cinema { get; set; }

        [Range(1, 100)]
        public int RowNumber { get; set; }

        [Range(1, 100)]
        public int SeatNumber { get; set; }
    }
}
