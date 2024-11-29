class Vector2 {
	x: number;
	y: number;

	constructor();
	constructor(x: number, y: number);
	constructor(x?: number, y?: number) {
		this.x = x === undefined ? 0 : x;
		this.y = y === undefined ? 0 : y;
	}
}

class Glyph {
	id: number = 0;
	position: Vector2 = new Vector2();
	size: Vector2 = new Vector2();
	offset: Vector2 = new Vector2();
	x_advance: number = 0;
}

function image_coord_to_index(coord: Vector2, image_width: number): number {
	return coord.x + coord.y * image_width;
}

function index_to_image_coord(index: number, image_width: number): Vector2 {
	return { x: index % image_width, y: Math.floor(index / image_width) };
}

function get_image_data(image: HTMLImageElement): ImageData {
	let fb_canvas = document.createElement("canvas");
	let fb_ctx = fb_canvas.getContext("2d") as CanvasRenderingContext2D;

	fb_canvas.width = image.width;
	fb_canvas.height = image.height;

	fb_ctx.drawImage(image, 0, 0);
	return fb_ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function is_rect_empty(image: ImageData, position: Vector2, size: Vector2): boolean {
	for (let y = position.y; y < position.y + size.y; y++) {
		for (let x = position.x; x < position.x + size.x; x++) {
			let alpha = image.data[image_coord_to_index(new Vector2(x, y), image.width) * 4 + 3];

			if (alpha > 0) {
				return false;
			}
		}
	}

	return true;
}

function draw_checkerboard_pattern(context: CanvasRenderingContext2D, size: number): void {
	for (let y = 0; y < context.canvas.height; y+= size) {
		for (let x = 0; x < context.canvas.width; x += size) {
			if ((x + y) % (size * 2)) {
				context.fillRect(x, y, size, size);
			}
		}
	}
}