using tickets.Models;

namespace tickets.ViewModels
{
    public class ScreeningSeatsVm
    {
        public int ScreeningId { get; set; }
        public string FilmTitle { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public List<Seat> Seats { get; set; } = new();
        public HashSet<int> ReservedSeatIds { get; set; } = new();
        public HashSet<int> MySeatIds { get; set; } = new();
        public bool IsLoggedIn { get; set; }
    }
}
