using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace tickets.Models
{
    public class AppUser : IdentityUser
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}   