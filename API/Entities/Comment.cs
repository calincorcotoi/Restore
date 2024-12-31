namespace API.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Text { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set; }
    }
}
