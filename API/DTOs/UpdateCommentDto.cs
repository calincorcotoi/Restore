using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpdateCommentDto
{
    [Required]
    public int CommentId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Text { get; set; }
}
