const calculateScore = (rows, levelVal) =>  {
	let multiplier;
	switch (rows) {
		case 1:
			multiplier = 4;
			break;
		case 2:
			multiplier = 10;
			break;
		case 3:
			multiplier = 30;
			break;
		case 4:
			multiplier = 120;
			break;
		default:
			multiplier = 1;
	}
	return levelVal * multiplier;
}

export {calculateScore}
