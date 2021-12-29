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
export const getCookie = (name) => {
    let arr,reg = new RegExp('(^| )' + name+'=([^;]*)(;|$)');
    const temp = document.cookie.match(reg);
    if(temp) {
        arr = temp;
        return unescape(arr[2]);
    } else {
        return null;
    }
};

