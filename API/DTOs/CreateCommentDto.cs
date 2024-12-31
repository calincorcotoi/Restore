using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateCommentDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Text { get; set; }
}
