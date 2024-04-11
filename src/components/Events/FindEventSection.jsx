import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();

  /*
  util/http.js의 fetchEvents 함수의 내용을 조금 변경하여 재사용
  queryKey:
    newEventsSection에서 요청한 데이터를 events라는 key로 캐시에 저장되어 있다.
    그러나, 해당 컴포넌트에서는 모든 데이터에 대한 요청이 아니라 검색한 데이터 일부에 대한 요청이다.

  동적 쿼리로 기존 ref가 아니라 useState를 사용하는 이유 :
    searchElement.current.value처럼 ref를 사용하면 검색어가 변경되더라도 컴포넌트 재렌더링이 발생하지 않음
    따라서, 검색어를 바꾸더라도 다시 요청하지 않고 이전 결과를 계속 보여주기 때문에 useState를 사용하는 것이 권장.

  queryKey: ['events', { search: searchTerm }]
    만약 검색어 입력을 하지 않았을 경우 (searchTerm의 값이 없을 경우) -> ['events']로 저장된 캐시 데이터를 가져옴

  signal :
    useQuery에서 받는 signal로 요청을 취소할 때 사용한다.
    fetchEvents 내부에서 fetch 2번째 매개변수로 {signal: signal}로 설정하면 된다.

  enabled :
    true - 요청o, false - 요청x
    초기에는 검색어가 undefined로 아무런 events 보여주지 않는다.
    이후 city 검색하면 city와 관련된 event가 검색되고 
    만약 빈 문자열을 입력하면 모든 events가 검색되도록 한다.
  */

  const [searchTerm, setSearchTerm] = useState();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;
  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occured"
        message={error.info?.message || 'Failed to fetch events.'}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
