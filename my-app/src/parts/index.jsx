import { useSelector } from "react-redux";
import { selectAllSights } from "./sights/sightsSlice";
import SightPage from "./sights/SightPage";
import { useEffect, useState } from "react";

export default function Index() {
  const sights = useSelector(selectAllSights);
  const [limit, setLimit] = useState(sessionStorage.getItem("limit") || 5);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const bodyHeight = document.body.scrollHeight - window.innerHeight;
      sessionStorage.setItem("currentScrollPosition", scrollY);

      if (scrollY === bodyHeight) {
        if (limit < sights.length + 5) {
          setLimit((prevLimit) => prevLimit + 5);
          sessionStorage.setItem("limit", limit + 5);
        }
      }
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [sights, limit]);

  const paginatedSights = sights.slice(0, limit);

  return (
    <div id="index">
      <div>
        <h1>{`Проект "Фото достопримечательностей"`}</h1>
        <p>
          Проект представляет собой сайт с фотографиями достопримечательнстей. Юзеры сами загружают фото и комментируют
          их.
        </p>
      </div>

      <div>
        {paginatedSights?.map((sight) => {
          return <SightPage key={sight._id} id={sight._id} />;
        })}
      </div>
    </div>
  );
}
