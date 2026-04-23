using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace tickets.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear reservations before schema change — old SeatNumber values are not valid SeatIds
            migrationBuilder.Sql("DELETE FROM Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_ScreeningId_RowNumber_SeatNumber",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "RowNumber",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "SeatNumber",
                table: "Reservations",
                newName: "SeatId");

            migrationBuilder.CreateTable(
                name: "Seats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CinemaId = table.Column<int>(type: "int", nullable: false),
                    RowNumber = table.Column<int>(type: "int", nullable: false),
                    SeatNumber = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Seats_Cinemas_CinemaId",
                        column: x => x.CinemaId,
                        principalTable: "Cinemas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Seats",
                columns: new[] { "Id", "CinemaId", "RowNumber", "SeatNumber" },
                values: new object[,]
                {
                    { 1, 1, 1, 1 },
                    { 2, 1, 1, 2 },
                    { 3, 1, 1, 3 },
                    { 4, 1, 1, 4 },
                    { 5, 1, 1, 5 },
                    { 6, 1, 1, 6 },
                    { 7, 1, 1, 7 },
                    { 8, 1, 1, 8 },
                    { 9, 1, 2, 1 },
                    { 10, 1, 2, 2 },
                    { 11, 1, 2, 3 },
                    { 12, 1, 2, 4 },
                    { 13, 1, 2, 5 },
                    { 14, 1, 2, 6 },
                    { 15, 1, 2, 7 },
                    { 16, 1, 2, 8 },
                    { 17, 1, 3, 1 },
                    { 18, 1, 3, 2 },
                    { 19, 1, 3, 3 },
                    { 20, 1, 3, 4 },
                    { 21, 1, 3, 5 },
                    { 22, 1, 3, 6 },
                    { 23, 1, 3, 7 },
                    { 24, 1, 3, 8 },
                    { 25, 1, 4, 1 },
                    { 26, 1, 4, 2 },
                    { 27, 1, 4, 3 },
                    { 28, 1, 4, 4 },
                    { 29, 1, 4, 5 },
                    { 30, 1, 4, 6 },
                    { 31, 1, 4, 7 },
                    { 32, 1, 4, 8 },
                    { 33, 1, 5, 1 },
                    { 34, 1, 5, 2 },
                    { 35, 1, 5, 3 },
                    { 36, 1, 5, 4 },
                    { 37, 1, 5, 5 },
                    { 38, 1, 5, 6 },
                    { 39, 1, 5, 7 },
                    { 40, 1, 5, 8 },
                    { 41, 2, 1, 1 },
                    { 42, 2, 1, 2 },
                    { 43, 2, 1, 3 },
                    { 44, 2, 1, 4 },
                    { 45, 2, 1, 5 },
                    { 46, 2, 1, 6 },
                    { 47, 2, 1, 7 },
                    { 48, 2, 1, 8 },
                    { 49, 2, 1, 9 },
                    { 50, 2, 1, 10 },
                    { 51, 2, 2, 1 },
                    { 52, 2, 2, 2 },
                    { 53, 2, 2, 3 },
                    { 54, 2, 2, 4 },
                    { 55, 2, 2, 5 },
                    { 56, 2, 2, 6 },
                    { 57, 2, 2, 7 },
                    { 58, 2, 2, 8 },
                    { 59, 2, 2, 9 },
                    { 60, 2, 2, 10 },
                    { 61, 2, 3, 1 },
                    { 62, 2, 3, 2 },
                    { 63, 2, 3, 3 },
                    { 64, 2, 3, 4 },
                    { 65, 2, 3, 5 },
                    { 66, 2, 3, 6 },
                    { 67, 2, 3, 7 },
                    { 68, 2, 3, 8 },
                    { 69, 2, 3, 9 },
                    { 70, 2, 3, 10 },
                    { 71, 2, 4, 1 },
                    { 72, 2, 4, 2 },
                    { 73, 2, 4, 3 },
                    { 74, 2, 4, 4 },
                    { 75, 2, 4, 5 },
                    { 76, 2, 4, 6 },
                    { 77, 2, 4, 7 },
                    { 78, 2, 4, 8 },
                    { 79, 2, 4, 9 },
                    { 80, 2, 4, 10 },
                    { 81, 2, 5, 1 },
                    { 82, 2, 5, 2 },
                    { 83, 2, 5, 3 },
                    { 84, 2, 5, 4 },
                    { 85, 2, 5, 5 },
                    { 86, 2, 5, 6 },
                    { 87, 2, 5, 7 },
                    { 88, 2, 5, 8 },
                    { 89, 2, 5, 9 },
                    { 90, 2, 5, 10 },
                    { 91, 2, 6, 1 },
                    { 92, 2, 6, 2 },
                    { 93, 2, 6, 3 },
                    { 94, 2, 6, 4 },
                    { 95, 2, 6, 5 },
                    { 96, 2, 6, 6 },
                    { 97, 2, 6, 7 },
                    { 98, 2, 6, 8 },
                    { 99, 2, 6, 9 },
                    { 100, 2, 6, 10 },
                    { 101, 3, 1, 1 },
                    { 102, 3, 1, 2 },
                    { 103, 3, 1, 3 },
                    { 104, 3, 1, 4 },
                    { 105, 3, 1, 5 },
                    { 106, 3, 1, 6 },
                    { 107, 3, 1, 7 },
                    { 108, 3, 1, 8 },
                    { 109, 3, 1, 9 },
                    { 110, 3, 1, 10 },
                    { 111, 3, 1, 11 },
                    { 112, 3, 1, 12 },
                    { 113, 3, 2, 1 },
                    { 114, 3, 2, 2 },
                    { 115, 3, 2, 3 },
                    { 116, 3, 2, 4 },
                    { 117, 3, 2, 5 },
                    { 118, 3, 2, 6 },
                    { 119, 3, 2, 7 },
                    { 120, 3, 2, 8 },
                    { 121, 3, 2, 9 },
                    { 122, 3, 2, 10 },
                    { 123, 3, 2, 11 },
                    { 124, 3, 2, 12 },
                    { 125, 3, 3, 1 },
                    { 126, 3, 3, 2 },
                    { 127, 3, 3, 3 },
                    { 128, 3, 3, 4 },
                    { 129, 3, 3, 5 },
                    { 130, 3, 3, 6 },
                    { 131, 3, 3, 7 },
                    { 132, 3, 3, 8 },
                    { 133, 3, 3, 9 },
                    { 134, 3, 3, 10 },
                    { 135, 3, 3, 11 },
                    { 136, 3, 3, 12 },
                    { 137, 3, 4, 1 },
                    { 138, 3, 4, 2 },
                    { 139, 3, 4, 3 },
                    { 140, 3, 4, 4 },
                    { 141, 3, 4, 5 },
                    { 142, 3, 4, 6 },
                    { 143, 3, 4, 7 },
                    { 144, 3, 4, 8 },
                    { 145, 3, 4, 9 },
                    { 146, 3, 4, 10 },
                    { 147, 3, 4, 11 },
                    { 148, 3, 4, 12 },
                    { 149, 3, 5, 1 },
                    { 150, 3, 5, 2 },
                    { 151, 3, 5, 3 },
                    { 152, 3, 5, 4 },
                    { 153, 3, 5, 5 },
                    { 154, 3, 5, 6 },
                    { 155, 3, 5, 7 },
                    { 156, 3, 5, 8 },
                    { 157, 3, 5, 9 },
                    { 158, 3, 5, 10 },
                    { 159, 3, 5, 11 },
                    { 160, 3, 5, 12 },
                    { 161, 3, 6, 1 },
                    { 162, 3, 6, 2 },
                    { 163, 3, 6, 3 },
                    { 164, 3, 6, 4 },
                    { 165, 3, 6, 5 },
                    { 166, 3, 6, 6 },
                    { 167, 3, 6, 7 },
                    { 168, 3, 6, 8 },
                    { 169, 3, 6, 9 },
                    { 170, 3, 6, 10 },
                    { 171, 3, 6, 11 },
                    { 172, 3, 6, 12 },
                    { 173, 3, 7, 1 },
                    { 174, 3, 7, 2 },
                    { 175, 3, 7, 3 },
                    { 176, 3, 7, 4 },
                    { 177, 3, 7, 5 },
                    { 178, 3, 7, 6 },
                    { 179, 3, 7, 7 },
                    { 180, 3, 7, 8 },
                    { 181, 3, 7, 9 },
                    { 182, 3, 7, 10 },
                    { 183, 3, 7, 11 },
                    { 184, 3, 7, 12 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ScreeningId_SeatId",
                table: "Reservations",
                columns: new[] { "ScreeningId", "SeatId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SeatId",
                table: "Reservations",
                column: "SeatId");

            migrationBuilder.CreateIndex(
                name: "IX_Seats_CinemaId",
                table: "Seats",
                column: "CinemaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Seats_SeatId",
                table: "Reservations",
                column: "SeatId",
                principalTable: "Seats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Seats_SeatId",
                table: "Reservations");

            migrationBuilder.DropTable(
                name: "Seats");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_ScreeningId_SeatId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_SeatId",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "SeatId",
                table: "Reservations",
                newName: "SeatNumber");

            migrationBuilder.AddColumn<int>(
                name: "RowNumber",
                table: "Reservations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ScreeningId_RowNumber_SeatNumber",
                table: "Reservations",
                columns: new[] { "ScreeningId", "RowNumber", "SeatNumber" },
                unique: true);
        }
    }
}
