import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../util/http.js';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';

export default function NewEventsSection() {
  /*
  required : queryKey, queryFn
  queryKey : 
    queryKey를 사용해 queryFn으로 요청하여 받은 데이터를 캐시 처리함. 
    이후 동일한 요청에 대해서는 이전 요청 응답을 재사용.
    값으로 배열[] 필요.

  queryFn : 
    요청 시, 실행할 코드를 정의함. 
    값으로 Promise를 반환하는 함수를 넣어야 함. (async ~ await fetch~)
  
  staleTime :
    데이터가 stale 상태로 간주되는 기간을 지정함
      stale 상태 = 이전 쿼리의 결과가 캐시되어 있지만, 업데이트 되지 않은 상태. 
    즉, 지정된 staleTime의 시간만큼 이전의 데이터를 통해 UI를 보여주다가 시간이 초과되면 업데이트된 데이터를 요청하여 UI 적용
    디폴트 값 = 0 (항상 최신 상태의 데이터를 사용하여 UI를 보여준다.)

  gcTime :
    캐시에서 data가 제거되는데 걸리는 시간 지정
    메모리 사용량 최적화 목적으로 사용함.


  data = useQuery 반환 데이터 객체에서 응답 데이터에 해당
  isPending = useQuery 과정은 즉각적으로 이루어지지 않음. (요청, 응답 등등) 즉, 요청 중인지 끝났는지 등을 확인
  isError = 응답 데이터 문제가 발생하여 오류를 받을 경우 true 값이 저장되어 있음.
  error = isError가 true일 경우, 해당 오류에 대한 정보가 포함되어 있음. 
  */
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    // staleTime:
    // gcTime:
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
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
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
