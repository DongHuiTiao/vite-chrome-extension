export interface VideoInfo {
	bvid: string;
	created: number;
}

export enum OneGroupVideoInfoCode {
    Success = 0,
    Abnormal = -1200
}

export interface OneGroupVideoInfo {
	code: OneGroupVideoInfoCode;
	newList: VideoInfo[]
}

export interface GuguLength {
	bvid: string;
	guguLength: number;
}

export interface UpGugu {
    mid: number; // 用户 mid
    uname: string; // 昵称
    face: string; // 头像
    currentGuguLength?: number; // 当前 咕咕 多久
    averageGuguLength?: number; // 平均 更新 频率
    maxGuguLength?: number; // 最大 咕咕 时间
    videosNum: number; // 视频的数量
    currentHaveVideosNum: number; // 当前获取了多少
	guguLengthList: GuguLength[]; // 每一期视频咕咕了多长时间
}