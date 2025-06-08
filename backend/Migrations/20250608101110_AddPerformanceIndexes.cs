using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "idx_products_category_price",
                table: "Products",
                columns: new[] { "Category", "Price" });

            migrationBuilder.CreateIndex(
                name: "idx_products_color",
                table: "Products",
                column: "Color");

            migrationBuilder.CreateIndex(
                name: "idx_products_count",
                table: "Products",
                column: "Count");

            migrationBuilder.CreateIndex(
                name: "idx_products_en_name",
                table: "Products",
                column: "EnName");

            migrationBuilder.CreateIndex(
                name: "idx_products_likes",
                table: "Products",
                column: "Likes");

            migrationBuilder.CreateIndex(
                name: "idx_products_price",
                table: "Products",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "idx_products_size",
                table: "Products",
                column: "Size");

            migrationBuilder.CreateIndex(
                name: "idx_products_ua_name",
                table: "Products",
                column: "UaName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_products_category_price",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_color",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_count",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_en_name",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_likes",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_price",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_size",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "idx_products_ua_name",
                table: "Products");
        }
    }
}
