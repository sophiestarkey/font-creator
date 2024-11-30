let canvas = document.getElementById("viewport") as HTMLCanvasElement;
let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const image_margin = new Vector2(0, 0);
const char_margin = new Vector2(0, 0);
const char_size = new Vector2(10, 10);
const image_size = new Vector2();
let baseline = 0;
let character_range_start = 32;
let character_range_end = 126;
let file_name = "";

const image = document.createElement("img");

document.body.oninput = (ev) => {
	image_margin.x = (document.getElementById("image_margin_x") as HTMLInputElement).valueAsNumber;
	image_margin.y = (document.getElementById("image_margin_y") as HTMLInputElement).valueAsNumber;
	char_margin.x = (document.getElementById("glyph_margin_x") as HTMLInputElement).valueAsNumber;
	char_margin.y = (document.getElementById("glyph_margin_y") as HTMLInputElement).valueAsNumber;
	char_size.x = (document.getElementById("glyph_size_x") as HTMLInputElement).valueAsNumber;
	char_size.y = (document.getElementById("glyph_size_y") as HTMLInputElement).valueAsNumber;
	baseline = (document.getElementById("baseline") as HTMLInputElement).valueAsNumber;
	character_range_start = (document.getElementById("character_range_start") as HTMLInputElement).valueAsNumber;
	character_range_end = (document.getElementById("character_range_end") as HTMLInputElement).valueAsNumber;

	main(image);
};

let image_file_input = document.getElementById("image_file_input") as HTMLInputElement;
image_file_input.onchange = (ev: Event) => {
	if (!image_file_input.files || !image_file_input.files.length) {
		return;
	}

	let file = image_file_input.files[0];
	file_name = file.name;
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
	image_size.x = image.width;
	image_size.y = image.height;

	// generate glyph data
	let glyphs = new Array<Glyph>();

	let num_cols = Math.floor((image_size.x - image_margin.x + char_margin.x) / (char_size.x + char_margin.x));
	let num_rows = Math.floor((image_size.y - image_margin.y + char_margin.y) / (char_size.y + char_margin.y));

	for (let i = 0; i < num_cols * num_rows; i++) {
		let glyph = new Glyph();

		glyph.id = character_range_start + i;
		if (glyph.id > character_range_end) break;

		let col = i % num_cols;
		let row = Math.floor(i / num_cols);

		glyph.position.x = image_margin.x + (char_size.x + char_margin.x) * col;
		glyph.position.y = image_margin.y + (char_size.y + char_margin.y) * row;
		glyph.size.x = char_size.x;
		glyph.size.y = char_size.y;
		glyph.advance = glyph.size.x + 1;

		glyphs.push(glyph);
	}

	// adjust glyph dimensions
	let image_data = get_image_data(image);

	for (let glyph of glyphs) {
		let min_x = -1;
		let min_y = -1;
		let max_x = -1;
		let max_y = -1;

		for (let y = glyph.position.y; y < glyph.position.y + glyph.size.y; y++) {
			for (let x = glyph.position.x; x < glyph.position.x + glyph.size.x; x++) {
				let alpha = image_data.data[(y * image_size.x + x) * 4 + 3];
				if (alpha == 0) continue;

				min_x = min_x == -1 ? x : Math.min(min_x, x);
				min_y = min_y == -1 ? y : Math.min(min_y, y);
				max_x = max_x == -1 ? x : Math.max(max_x, x);
				max_y = max_y == -1 ? y : Math.max(max_y, y);
			}
		}

		if (min_x == -1) min_x = glyph.position.x;
		if (min_y == -1) min_y = glyph.position.y;
		if (max_x == -1) max_x = glyph.position.x + glyph.size.x - 1;
		if (max_y == -1) max_y = glyph.position.y + glyph.size.y - 1;

		glyph.offset.y = min_y - glyph.position.y;
		glyph.position.x = min_x;
		glyph.position.y = min_y;
		glyph.size.x = max_x - min_x + 1;
		glyph.size.y = max_y - min_y + 1;
		glyph.advance = glyph.size.x + 1;
	}

	// output glyph information in AngelCode's BMFont format
	let fnt = create_fnt_file();

	if (file_name.lastIndexOf(".") != -1) {
		fnt.info.face = file_name.substring(0, file_name.lastIndexOf("."));
	} else {
		fnt.info.face = file_name;
	}

	fnt.info.size = char_size.y;
	fnt.info.spacing.horizontal = char_margin.x;
	fnt.info.spacing.vertical = char_margin.y;
	fnt.common.lineHeight = char_size.y + 1;
	fnt.common.base = baseline;
	fnt.common.scaleW = image_size.x;
	fnt.common.scaleH = image_size.y;
	fnt.pages.push({
		id: 0,
		file: file_name
	});

	for (let glyph of glyphs) {
		fnt.chars.push({
			id: glyph.id,
			x: glyph.position.x,
			y: glyph.position.y,
			width: glyph.size.x,
			height: glyph.size.y,
			xoffset: glyph.offset.x,
			yoffset: glyph.offset.y,
			xadvance: glyph.advance,
			page: 0,
			chnl: 15
		});
	}

	(document.getElementById("output") as HTMLTextAreaElement).value = fnt_to_string(fnt);

	draw(glyphs);
}

function draw(glyphs: Array<Glyph>): void {
	const scale = Math.floor(Math.min(canvas.width / image_size.x, canvas.height / image_size.y));

	ctx.reset();
	ctx.imageSmoothingEnabled = false;
	ctx.lineWidth = 1 / scale;

	// draw checkerboard background
	ctx.fillStyle = "#303030";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#404040";
	draw_checkerboard_pattern(ctx, 10);

	// scale context and center align
	ctx.scale(scale, scale);
	ctx.translate(Math.floor((canvas.width / scale - image_size.x) / 2), Math.floor((canvas.height / scale - image_size.y) / 2));

	// draw image
	ctx.drawImage(image, 0, 0);

	// image boundary
	ctx.strokeStyle = "blue";
	ctx.strokeRect(0, 0, image_size.x, image_size.y);

	// glyph boundary
	ctx.strokeStyle = "yellow";
	for (let glyph of glyphs) {
		ctx.strokeRect(glyph.position.x, glyph.position.y, glyph.size.x, glyph.size.y);
	}
	
	// glyph baseline
	ctx.strokeStyle = "red";
	for (let y = image_margin.y + baseline; y <= image_size.y; y += char_size.y + char_margin.y) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(image_size.x, y);
		ctx.closePath();
		ctx.stroke();
	}
}