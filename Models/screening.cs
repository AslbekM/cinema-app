using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tickets.Models
{
    public class Screening
    {
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string FilmTitle { get; set; } = string.Empty;

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public int CinemaId { get; set; }

        [ForeignKey("CinemaId")]
        public Cinema? Cinema { get; set; }
    }
}