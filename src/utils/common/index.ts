// fetch 请求
export const useFetch = () => {
    const jsonFetch = (url) => {
        return fetch(url, {
            "mode": "cors",
            "credentials": "include"
        })
        .then(res => res.json())
        .then(res => {
            return res;
        })
    };
    return {
        jsonFetch
    }
}

// 延迟执行
export const sleep = async (time) => {
    return new Promise((resolve) => {
        setTimeout(()=>{
            resolve(`延迟执行 ${time} ms`);
        }, time);
    });
};

// 单位数转成双位数
export const toDouble = num => num > 9 ? num : '0' + num;

// 读取 cookie 中某个字段的值
export const getCookie = (name: string) => {
    let arr,reg = new RegExp('(^| )' + name+'=([^;]*)(;|$)');
    const temp = document.cookie.match(reg);
    if(temp) {
        arr = temp;
        return unescape(arr[2]);
    } else {
        return null;
    }
};

// 获得生肖
export const getZodiac = birthdayTime => {
	if (birthdayTime < 0) return '';
	const birthdayDate = new Date(birthdayTime * 1000);
	const year = birthdayDate.getFullYear();
	const month = birthdayDate.getMonth() + 1;
	const date = birthdayDate.getDate();
	// 先获得生日的四个数据
	// 获得世纪值
	const getC = () => {
		const century = Math.floor(year / 100) + 1;
		let C;
		switch (century) {
			case 20:
				C = 4.6295;
				break;
			case 21:
				C = 3.87;
				break;
			case 22:
				C = 4.15;
				break;
			default:
				C = 3.87;
		}
		return C;
	};
	// 计算立春
	const getSpringDay = () => {
		const Y = year % 100;
		const D = 0.2422;
		const C = getC();
		const L = (Y - 1) / 4;
		return Math.floor(Y * D + C) - Math.floor(L);
	};
	// 计算当前 - 1900 与 12 的余数
	const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
	let myPos = (year - 1900) % 12;
	const springDay = getSpringDay();

	switch (month) {
		case 1:
			myPos--;
			if (myPos < 0) {
				myPos = 11;
			}
			break;
		case 2:
			if (date < springDay) {
				myPos--;
				if (myPos < 0) {
					myPos = 11;
				}
			}
			break;
	}
	const myZodiac = zodiac[myPos];
	return myZodiac;
};

// 获得星座
export const getConstellation = birthdayTime => {
	if (birthdayTime < 0) return '';
	const birthdayDate = new Date(birthdayTime * 1000);
	const year = birthdayDate.getFullYear();
	const month = birthdayDate.getMonth() + 1;
	const date = birthdayDate.getDate();
	if (year === 1980 && month === 1 && date === 1) return '';
	const stringValue = '魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯';
	const monthBreak = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
	const start = month * 2 - (date < monthBreak[month - 1] ? 2 : 0);
	return stringValue.substring(start, start + 2) + '座';
};

// 深拷贝
export const deepClone = (value) => {
	if (typeof value !== 'object' || value === null) {
		return value;
	}
	let obj;
	if(value instanceof Array) {
		obj = [];
	} else {
		obj = {};
	}
	for(let key in value) {
		if(value.hasOwnProperty(key)) {
			obj[key] = deepClone(value[key]);
		}
	}
	return obj;
}

export const getMyMid = () => {
	return getCookie('DedeUserID');
}

