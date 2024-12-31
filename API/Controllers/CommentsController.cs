using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class CommentsController : BaseApiController
{
    private readonly StoreContext _context;
    private readonly UserManager<User> _userManager;

    public CommentsController(StoreContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("{productId}")]
    public async Task<ActionResult<List<Comment>>> GetComments(int productId)
    {
        Product product = await _context.Products.FindAsync(productId);

        if (product == null) return NotFound();

        List<Comment> comments = await _context.Comments.Where(c => c.ProductId == productId).ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult<Comment>> CreateComment(CreateCommentDto createCommentDto)
    {
        Product product = await _context.Products.FindAsync(createCommentDto.ProductId);

        if (product == null) return NotFound();
        User user = await _userManager.FindByNameAsync(User.Identity.Name);

        Comment comment = new Comment
        {
            Text = createCommentDto.Text,
            ProductId = product.Id,
            UserId = user.Id
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [Authorize]
    [HttpPost("{id}")]
    public async Task<ActionResult<Comment>> EditComment(UpdateCommentDto updateCommentDto)
    {
        Comment comment = await _context.Comments.FindAsync(updateCommentDto.CommentId);

        if (comment == null) return NotFound();
        if (comment.UserId != (await _userManager.FindByNameAsync(User.Identity.Name)).Id) return Unauthorized();

        comment.Text = updateCommentDto.Text;
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteComment(int id)
    {
        Comment comment = await _context.Comments.FindAsync(id);

        if (comment == null) return NotFound();
        if (comment.UserId != (await _userManager.FindByNameAsync(User.Identity.Name)).Id) return Unauthorized();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
