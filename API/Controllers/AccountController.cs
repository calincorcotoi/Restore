using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly UserManager<User> _userManager;
    private readonly TokenService _tokenService;
    private readonly StoreContext _context;

    public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
    {
        _context = context;
        _tokenService = tokenService;
        _userManager = userManager;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        IQueryable<User> a = _userManager.Users;
        User user = await _userManager.FindByNameAsync(loginDto.Username);
        if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            return Unauthorized();

        Basket userBasket = await RetrieveBasket(loginDto.Username);
        Basket anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]);

        if (anonBasket != null)
        {
            if (userBasket != null) _context.Baskets.Remove(userBasket);
            anonBasket.BuyerId = user.UserName;
            Response.Cookies.Delete("buyerId");
            await _context.SaveChangesAsync();
        }

        return new UserDto
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto()
        };
    }

    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
    {
        User user = new User { UserName = registerDto.Username, Email = registerDto.Email };

        IdentityResult result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem();
        }

        await _userManager.AddToRoleAsync(user, "Member");

        return StatusCode(201);
    }

    [Authorize]
    [HttpGet("currentUser")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        User user = await _userManager.FindByNameAsync(User.Identity.Name);

        Basket userBasket = await RetrieveBasket(User.Identity.Name);

        return new UserDto
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = userBasket?.MapBasketToDto()
        };
    }

    [Authorize]
    [HttpGet("savedAddress")]
    public async Task<ActionResult<UserAddress>> GetSavedAddress()
    {
        return await _userManager.Users
            .Where(x => x.UserName == User.Identity.Name)
            .Select(user => user.Address)
            .FirstOrDefaultAsync();
    }

    private async Task<Basket> RetrieveBasket(string buyerId)
    {
        if (string.IsNullOrEmpty(buyerId))
        {
            Response.Cookies.Delete("buyerId");
            return null;
        }

        return await _context.Baskets
            .Include(i => i.Items)
            .ThenInclude(p => p.Product)
            .FirstOrDefaultAsync(basket => basket.BuyerId == buyerId);
    }
}