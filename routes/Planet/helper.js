const helper = {
	log: {
		info: (m) => {
			console.log(m);
		},
		head: (m) => {
			const hb = 4;
			const vb = m.length + hb*2 + 2;

			let hbm = '';
			let vbm = '';
			for (let h = 0; h < hb; h++) {
				hbm += '|';
			}

			for (let v = 0; v < vb; v++) {
				vbm += '|';
			}
			
			console.log('\n\x1b[32m' + vbm + '\x1b[37m');
			console.log('\x1b[32m' + hbm + ' ' + m + ' ' + hbm + '\x1b[37m');
			console.log('\x1b[32m' + vbm + '\x1b[37m\n');
		},

		subhead: (b) => {
			console.log('\x1b[34m' + '~~~~ ' + b + ' ~~~~' + '\x1b[37m\n');
		},

		success: (i, s) => {
			if (s) {
				console.log(i + "\x1b[32m" + s + "\x1b[37m");
			} else {
				console.log("\x1b[32m" + i + "\x1b[37m");
			}
		},

		err: (i, e) => {
			if (e) {
				console.log(i + "\x1b[31m" + e + "\x1b[37m");
			} else {
				console.log("\x1b[31m" + i + "\x1b[37m");
			}
			
		},
	}
}

module.exports = helper;