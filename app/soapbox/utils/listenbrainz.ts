import axios from "axios";

const getLData = (LBUser: string) => {
    return axios.get(`https://api.listenbrainz.org/1/user/${LBUser}/listens?count=1`).then((data) => {
      const title: string = data.data.payload.listens[0].track_metadata.track_name;
      const img: string = data.data.payload.listens[0].track_metadata.mbid_mapping && data.data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid ? `https://coverartarchive.org/release/${data.data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid}/front-250` : 'https://transfem.space/plugins/listenbrainz/images/cover-art-placeholder.png';
      const artist: string = data.data.payload.listens[0].track_metadata.artist_name;
      const lastlisten: string = data.data.payload.latest_listen_ts;
      const musicbrainzurl: string = data.data.payload.listens[0].track_metadata.mbid_mapping && data.data.payload.listens[0].track_metadata.mbid_mapping.recording_mbid ? `https://musicbrainz.org/recording/${data.data.payload.listens[0].track_metadata.mbid_mapping.recording_mbid}` : '#';
      const listenbrainzurl: string = data.data.payload.listens[0].track_metadata.mbid_mapping && data.data.payload.listens[0].track_metadata.mbid_mapping.recording_mbid ? `https://listenbrainz.org/player?recording_mbids=${data.data.payload.listens[0].track_metadata.mbid_mapping.recording_mbid}` : '#';
      return [title, img, artist, lastlisten, musicbrainzurl, listenbrainzurl];
    });
};

export {
  getLData
}