
const areas = {seongsu:{name:'성수동',lat:37.5445,lng:127.0557},yeonnam:{name:'연남동',lat:37.5626,lng:126.925},busan:{name:'전포동',lat:35.1575,lng:129.0633}};
const templates = [{slug:'coffee',name:'모퉁이의 커피',category:'cafe',label:'카페',description:'창가에 앉아 천천히 쉬어갈 수 있는 작은 카페. 따뜻한 커피 한 잔으로 오후의 속도를 낮춰보세요.',short:'햇살이 머무는 창가, 느긋한 커피 한 잔',seed:'gyeot-coffee',dy:.0017,dx:-.0023,x:31,y:32,icon:'cup-hot'},{slug:'walk',name:'초록을 따라 걷는 길',category:'walk',label:'산책',description:'가볍게 걸으며 바깥 공기를 즐기는 산책 코스의 예시입니다. 좋아하는 음악과 함께 잠시 걸어보세요.',short:'잠시 쉬어가는 초록빛 산책 코스',seed:'gyeot-green-path',dy:-.0022,dx:.0016,x:65,y:66,icon:'leaf'},{slug:'books',name:'취향이 모이는 작은 방',category:'culture',label:'문화 공간',description:'책과 작은 전시를 느긋하게 둘러보는 문화 공간의 예시입니다. 다음으로 좋아하게 될 취향을 만나보세요.',short:'책과 전시 사이에서 만나는 작은 취향',seed:'gyeot-book-room',dy:.0031,dx:.0032,x:70,y:28,icon:'book-2'}];
const data = Object.entries(areas).flatMap(([key,area])=>templates.map(t=>({...t,id:key+'-'+t.slug,area:key,lat:area.lat+t.dy,lng:area.lng+t.dx})));

export { areas, data };
