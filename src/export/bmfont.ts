type FntPage = {
	id: number;
	file: string;
};

type FntGlyph = {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	xoffset: number;
	yoffset: number;
	xadvance: number;
	page: number;
	chnl: number;
};

type FntKerning = {
	first: number;
	second: number;
	amount: number;
};

type FntFile = {
	info: {
		face: string;
		size: number;
		bold: number;
		italic: number;
		charset: string;
		unicode: number;
		stretchH: number;
		smooth: number;
		aa: number;
		padding: {
			up: number;
			right: number;
			down: number;
			left: number;
		}
		spacing: {
			horizontal: number;
			vertical: number;
		}
		outline: number;
	}
	common: {
		lineHeight: number;
		base: number;
		scaleW: number;
		scaleH: number;
		pages: number;
		packed: number;
		alphaChnl: number;
		redChnl: number;
		greenChnl: number;
		blueChnl: number;
	}
	pages: Array<FntPage>;
	chars: Array<FntGlyph>;
	kernings: Array<FntKerning>;
}

function create_fnt_file(): FntFile {
	return {
		info: {
			face: "",
			size: 0,
			bold: 0,
			italic: 0,
			charset: "",
			unicode: 1,
			stretchH: 100,
			smooth: 0,
			aa: 1,
			padding: {
				up: 0,
				right: 0,
				down: 0,
				left: 0
			},
			spacing: {
				horizontal: 0,
				vertical: 0
			},
			outline: 0
		},
		common: {
			lineHeight: 0,
			base: 0,
			scaleW: 0,
			scaleH: 0,
			pages: 0,
			packed: 0,
			alphaChnl: 0,
			redChnl: 0,
			greenChnl: 0,
			blueChnl: 0
		},
		pages: [],
		chars: [],
		kernings: []
	};
}

function fnt_to_string(fnt: FntFile): string {
	let result = "";
	result += `info face="${fnt.info.face}" size=${fnt.info.size} bold=${fnt.info.bold} italic=${fnt.info.italic} charset="${fnt.info.charset}" unicode=${fnt.info.unicode} stretchH=${fnt.info.stretchH} smooth=${fnt.info.smooth} aa=${fnt.info.aa} padding=${fnt.info.padding.up},${fnt.info.padding.right},${fnt.info.padding.down},${fnt.info.padding.left} spacing=${fnt.info.spacing.horizontal},${fnt.info.spacing.vertical} outline=${fnt.info.outline}\n`;
	result += `common lineHeight=${fnt.common.lineHeight} base=${fnt.common.base} scaleW=${fnt.common.scaleW} scaleH=${fnt.common.scaleH} pages=${fnt.common.pages} packed=${fnt.common.packed} alphaChnl=${fnt.common.alphaChnl} redChnl=${fnt.common.redChnl} greenChnl=${fnt.common.greenChnl} blueChnl=${fnt.common.blueChnl}\n`;

	for (let page of fnt.pages) {
		result += `page id=${page.id} file="${page.file}"\n`;
	}

	result += `chars count=${fnt.chars.length}\n`;

	for (let char of fnt.chars) {
		result += `char id=${char.id} x=${char.x} y=${char.y} width=${char.width} height=${char.height} xoffset=${char.xoffset} yoffset=${char.yoffset} xadvance=${char.xadvance} page=${char.page} chnl=${char.chnl}\n`;
	}

	result += `kernings count=${fnt.kernings.length}\n`;

	for (let kerning of fnt.kernings) {
		result += `kerning first=${kerning.first} second=${kerning.second} amount=${kerning.amount}\n`;
	}

	return result.trim();
}