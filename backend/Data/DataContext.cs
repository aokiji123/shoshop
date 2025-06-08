using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class DataContext : DbContext
{
    public DbSet<Product> Products { get; set; } 
    public DbSet<User> Users { get; set; }
    
    public DbSet<Order> Orders { get; set; }
    
    public DbSet<OrderProduct> OrderProducts { get; set; }
    
    public DbSet<AdminsChats> AdminsChats { get; set; }
    
    public DbSet<UserProductLike> UserProductLikes { get; set; }
    
    public DataContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure UUID generation
        modelBuilder.Entity<Product>()
            .Property(p => p.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Order>()
            .Property(o => o.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<OrderProduct>()
            .Property(op => op.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        // Configure enum properties
        modelBuilder.Entity<Product>()
            .Property(p => p.Size)
            .HasConversion<int>();

        modelBuilder.Entity<Product>()
            .Property(p => p.Color)
            .HasConversion<int>();

        modelBuilder.Entity<Product>()
            .Property(p => p.Category)
            .HasConversion<int>();
        
        // Configure decimal precision
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderProduct>()
            .Property(op => op.PriceAtTime)
            .HasPrecision(18, 2);
        
        // Configure relationships
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderProduct>()
            .HasOne(op => op.Order)
            .WithMany(o => o.OrderProducts)
            .HasForeignKey(op => op.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderProduct>()
            .HasOne(op => op.Product)
            .WithMany(p => p.OrderProducts)
            .HasForeignKey(op => op.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<UserProductLike>()
            .HasOne(upl => upl.User)
            .WithMany(u => u.LikedProducts)
            .HasForeignKey(upl => upl.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    
        modelBuilder.Entity<UserProductLike>()
            .HasOne(upl => upl.Product)
            .WithMany(p => p.UserLikes)
            .HasForeignKey(upl => upl.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Prevent duplicate likes
        modelBuilder.Entity<UserProductLike>()
            .HasIndex(upl => new { upl.UserId, upl.ProductId })
            .IsUnique();

        // Configure indexes
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Category)
            .HasDatabaseName("idx_products_category");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("idx_users_email");

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId)
            .HasDatabaseName("idx_orders_user_id");

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.CreatedAt)
            .HasDatabaseName("idx_orders_created_at");

        modelBuilder.Entity<OrderProduct>()
            .HasIndex(op => op.OrderId)
            .HasDatabaseName("idx_order_products_order_id");

        modelBuilder.Entity<OrderProduct>()
            .HasIndex(op => op.ProductId)
            .HasDatabaseName("idx_order_products_product_id");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Enable detailed logging for debugging Neon connections
        optionsBuilder.EnableSensitiveDataLogging();
        optionsBuilder.EnableDetailedErrors();
    }
}