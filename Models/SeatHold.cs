namespace tickets.Models
{
    /// <summary>A temporary hold on a seat while a user is checking out.</summary>
    public class SeatHold
    {
        public int Id { get; set; }
        public int ScreeningId { get; set; }
        public int SeatId { get; set; }
        public string AppUserId { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
