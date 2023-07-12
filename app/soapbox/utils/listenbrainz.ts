import axios from "axios";
import { useState, useEffect } from "react";
import { Account } from "soapbox/types/entities";
//const getLData = async (LBUser: string) => {
 // const { data } = await axios.get(`https://api.listenbrainz.org/1/user/${LBUser}/listens?count=1`);
 // return {'title': data.payload.listens[0].track_metadata.track_name, 'img': data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid ? `https://coverartarchive.org/release/${data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid}/front-250` : 'https://transfem.space/plugins/listenbrainz/images/cover-art-placeholder.png'};
//};

const getLData = (LBUser: string) => {
    return axios.get(`https://api.listenbrainz.org/1/user/${LBUser}/listens?count=1`).then((data) => {
      const title: string = data.data.payload.listens[0].track_metadata.track_name;
      const img: string = data.data.payload.listens[0].track_metadata.mbid_mapping && data.data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid ? `https://coverartarchive.org/release/${data.data.payload.listens[0].track_metadata.mbid_mapping.caa_release_mbid}/front-250` : 'https://transfem.space/plugins/listenbrainz/images/cover-art-placeholder.png';
      const artist: string = data.data.payload.listens[0].track_metadata.artist_name;
      const lastlisten: string = data.data.payload.latest_listen_ts;
      return [title, img, artist, lastlisten];
    });
};

const getLBZData = (LBUser: string, account: Account) => {
  const [ldata, setLData] = useState<string[] | string | null>(null);

  useEffect(() => {
    const fetchData = async (LBUser: string) => {
      try {
        const data = await getLData(LBUser);
        if (data != void 0) {
          setLData(data);
        } else {
          setLData('n/a');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData(LBUser); // Call the fetchData function when the component mounts

    // You can also return a cleanup function here if needed

  }, [account]);

  return ldata;
}

export {
  getLData
}