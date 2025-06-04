using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class OrdersAndConvertToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Users",
                type: "character varying(3000)",
                maxLength: 3000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "TgTag",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.Sql(@"ALTER TABLE ""Products"" ALTER COLUMN ""Size"" DROP DEFAULT;");
            
            migrationBuilder.Sql(@"
                ALTER TABLE ""Products"" 
                ALTER COLUMN ""Size"" TYPE integer 
                USING CASE 
                    WHEN ""Size"" = 'XS' THEN 0
                    WHEN ""Size"" = 'S' THEN 1
                    WHEN ""Size"" = 'M' THEN 2
                    WHEN ""Size"" = 'L' THEN 3
                    WHEN ""Size"" = 'XL' THEN 4
                    WHEN ""Size"" = 'XXL' THEN 5
                    WHEN ""Size"" = 'One Size' THEN 6
                    ELSE 2
                END;
            ");


            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "Products",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double precision");

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Products",
                type: "character varying(3000)",
                maxLength: 3000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.Sql(@"ALTER TABLE ""Products"" ALTER COLUMN ""Color"" DROP DEFAULT;");
            
            migrationBuilder.Sql(@"
                ALTER TABLE ""Products"" 
                ALTER COLUMN ""Color"" TYPE integer 
                USING CASE 
                    WHEN ""Color"" = 'red' THEN 0
                    WHEN ""Color"" = 'blue' THEN 1
                    WHEN ""Color"" = 'green' THEN 2
                    WHEN ""Color"" = 'yellow' THEN 3
                    WHEN ""Color"" = 'black' THEN 4
                    WHEN ""Color"" = 'white' THEN 5
                    WHEN ""Color"" = 'gray' THEN 6
                    WHEN ""Color"" = 'pink' THEN 7
                    WHEN ""Color"" = 'purple' THEN 8
                    WHEN ""Color"" = 'orange' THEN 9
                    WHEN ""Color"" = 'brown' THEN 10
                    WHEN ""Color"" = 'navy' THEN 11
                    WHEN ""Color"" = 'beige' THEN 12
                    WHEN ""Color"" = 'dark blue' THEN 1
                    WHEN ""Color"" = 'light blue' THEN 1
                    WHEN ""Color"" = 'khaki' THEN 6
                    ELSE 4
                END;
            ");
            
            migrationBuilder.Sql(@"ALTER TABLE ""Products"" ALTER COLUMN ""Category"" DROP DEFAULT;");
            
            migrationBuilder.Sql(@"
                ALTER TABLE ""Products"" 
                ALTER COLUMN ""Category"" TYPE integer 
                USING CASE 
                    WHEN ""Category"" = 'jeans' THEN 0
                    WHEN ""Category"" = 'hat' THEN 1
                    WHEN ""Category"" = 'shirt' THEN 2
                    WHEN ""Category"" = 'hoodie' THEN 3
                    WHEN ""Category"" = 'pants' THEN 4
                    WHEN ""Category"" = 'jacket' THEN 5
                    WHEN ""Category"" = 'accessory' THEN 6
                    ELSE 0
                END;
            ");

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    TgTag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderProducts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    PriceAtTime = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderProducts_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderProducts_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_order_products_order_id",
                table: "OrderProducts",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "idx_order_products_product_id",
                table: "OrderProducts",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "idx_orders_created_at",
                table: "Orders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "idx_orders_user_id",
                table: "Orders",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderProducts");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropColumn(
                name: "TgTag",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(3000)",
                oldMaxLength: 3000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Size",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<double>(
                name: "Price",
                table: "Products",
                type: "double precision",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Image",
                table: "Products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(3000)",
                oldMaxLength: 3000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
