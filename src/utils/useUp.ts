import { getCookie } from '../utils/common/index';

// 跟 up 相关的 hooks
export const useUp = () => {
    // 获取 up 主的个人 id
    const getUpMid = () => {
        return getCookie('DedeUserID');
    }
    return {
        getUpMid
    }
}