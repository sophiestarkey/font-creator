let canvas = document.getElementById("viewport") as HTMLCanvasElement;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;

const image_margin = new Vector2(0, 0);
const char_margin = new Vector2(0, 0);
const char_size = new Vector2(10, 10);

const image = document.createElement("img");

document.body.oninput = (ev) => {
	image_margin.x = (document.getElementById("image_margin_x") as HTMLInputElement).valueAsNumber;
	image_margin.y = (document.getElementById("image_margin_y") as HTMLInputElement).valueAsNumber;
	char_margin.x = (document.getElementById("glyph_margin_x") as HTMLInputElement).valueAsNumber;
	char_margin.y = (document.getElementById("glyph_margin_y") as HTMLInputElement).valueAsNumber;
	char_size.x = (document.getElementById("glyph_size_x") as HTMLInputElement).valueAsNumber;
	char_size.y = (document.getElementById("glyph_size_y") as HTMLInputElement).valueAsNumber;

	main(image);
};

let image_file_input = document.getElementById("image_file_input") as HTMLInputElement;
image_file_input.onchange = (ev: Event) => {
	if (!image_file_input.files || !image_file_input.files.length) {
		return;
	}

	let file = image_file_input.files[0];
	let reader = new FileReader();

	reader.onload = (ev: ProgressEvent<FileReader>) => {
		image.src = reader.result as string;
		image.onload = () => main(image);
	};

	reader.readAsDataURL(file);
};

// temporary fix to avoid needing to interact with input controls after page refresh
document.body.dispatchEvent(new InputEvent("input"));
image_file_input.dispatchEvent(new Event("change"));

function main(image: HTMLImageElement): void {
	const image_size = new Vector2(image.width, image.height);

	// generate glyph data
	let glyphs = new Array<Glyph>();

	let num_cols = Math.floor((image_size.x - image_margin.x + char_margin.x) / (char_size.x + char_margin.x));
	let num_rows = Math.floor((image_size.y - image_margin.y + char_margin.y) / (char_size.y + char_margin.y));

	for (let i = 0; i < num_cols * num_rows; i++) {
		let glyph = new Glyph();

		// temporary code to limit glyph range
		glyph.id = 32 + i;
		if (glyph.id > 126) break;

		let col = index_to_image_coord(i, num_cols).x;
		let row = index_to_image_coord(i, num_cols).y;

		glyph.position.x = image_margin.x + (char_size.x + char_margin.x) * col;
		glyph.position.y = image_margin.y + (char_size.y + char_margin.y) * row;
		glyph.size.x = char_size.x;
		glyph.size.y = char_size.y;
		glyph.x_advance = glyph.size.x + 1;

		glyphs.push(glyph);
	}

	// adjust glyph dimensions
	let image_data = get_image_data(image);

	for (let glyph of glyphs) {
		// trim horizontal space before glyph
		for (let x = glyph.position.x; x < glyph.position.x + glyph.size.x; x++) {
			if (!is_rect_empty(image_data, new Vector2(x, glyph.position.y), new Vector2(1, glyph.size.y))) {
				glyph.size.x -= x - glyph.position.x;
				glyph.position.x = x;
				break;
			}
		}

		// trim horizontal space after glyph
		for (let x = glyph.position.x + glyph.size.x - 1; x >= glyph.position.x; x--) {
			if (!is_rect_empty(image_data, new Vector2(x, glyph.position.y), new Vector2(1, glyph.size.y))) {
				glyph.size.x = x - glyph.position.x + 1;
				break;
			}
		}

		glyph.x_advance = glyph.size.x + 1;
	}

	// draw glyph information
	ctx.resetTransform();

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.scale(5, 5);

	for (let glyph of glyphs) {
		ctx.fillStyle = "maroon";
		ctx.fillRect(glyph.position.x, glyph.position.y, glyph.x_advance, glyph.size.y);
		ctx.fillStyle = "navy";
		ctx.fillRect(glyph.position.x, glyph.position.y, glyph.size.x, glyph.size.y);
	}

	ctx.drawImage(image, 0, 0);

	// output glyph information in AngelCode's BMFont format
	let output_string = "";

	for (let glyph of glyphs) {
		output_string += glyph_to_string(glyph) + "\n";
	}

	(document.getElementById("output") as HTMLTextAreaElement).value = output_string;
}

function glyph_to_string(glyph: Glyph): string {
	return `char id=${glyph.id} x=${glyph.position.x} y=${glyph.position.y} width=${glyph.size.x} height=${glyph.size.y} xoffset=${glyph.offset.x} yoffset=${glyph.offset.y} xadvance=${glyph.x_advance} page=0 chnl=15`;
}