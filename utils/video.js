import axios from 'axios';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const youtubeApi = 'https://www.googleapis.com/youtube/v3/videos';

/*
This function is only used to fetch YouTube video publish time when
a video is created in keystone AdminUI
*/
export function prefetchYouTubeVideoDetial(videoId) {
	const params = {
		id: videoId,
		key: process.env.YOUTUBE_API_KEY,
		part: 'snippet, contentDetails'
	};

	return axios
		.get(youtubeApi, { params: params })
		.then(res => {
			return {
				publishedAt: res.data.items[0].snippet.publishedAt,
				thumbnail: res.data.items[0].snippet.thumbnails.high
					? res.data.items[0].snippet.thumbnails.high.url
					: res.data.items[0].snippet.thumbnails.default.url,
				title: res.data.items[0].snippet.title,
				duration: dayjs
					.duration(
						dayjs
							.duration(res.data.items[0].contentDetails.duration)
							.as('milliseconds')
					)
					.format('HH:mm:ss')
					.replace(/^00:/, '')
			};
		})
		.catch(err => err);
}

export const getLocalVideosDetails = videos => {
	const relativeTime = require('dayjs/plugin/relativeTime');
	dayjs.extend(relativeTime);
	return videos.map(video => {
		return {
			thumbnail: video.thumbnail,
			slug: video.slug,
			name: video.name,
			title: video.title,
			videoHeroName: video.videoHeroName,
			relatedProgram: video.relatedProgram,
			description: video.description,
			createdAt: new Date(video.createdAt),
			publishedDate: dayjs(video.createdAt).fromNow(true),
			videoHeroGender: video.videoHeroGender,
			youtubeUrl: `https://www.youtube.com/embed/${video.youtubeId}?rel=0&amp;showinfo=0&amp;autoplay=1`,
			bilibiliUrl: video.bilibiliId
				? `https://player.bilibili.com/player.html?bvid=${video.bilibiliId}`
				: '',
			tag: video.tag,
			duration: video.duration
		};
	});
};
