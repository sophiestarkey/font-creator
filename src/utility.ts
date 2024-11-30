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
	advance: number = 0;
}

function get_image_data(image: HTMLImageElement): ImageData {
	let fb_canvas = document.createElement("canvas");
	let fb_ctx = fb_canvas.getContext("2d") as CanvasRenderingContext2D;

	fb_canvas.width = image.width;
	fb_canvas.height = image.height;

	fb_ctx.drawImage(image, 0, 0);
	return fb_ctx.getImageData(0, 0, fb_canvas.width, fb_canvas.height);
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