import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  /*
  useQuery와는 다르게 fetch 요청을 원하는 시점에 가능함 (useQuery는 컴포넌트 렌더링 때, 바로 요청)

  mutationKey :
    useQuery와 다르게 non-required.
    POST 요청은 데이터를 캐시처리 안하기 때문
  mutationFn :
    util/http.js의 createNewEvent 함수에서 eventData를 매개변수로 받아야 하는데, 익명함수를 안썻다.
      반환된 변수 중, mutate를 사용하면 해당 컴포넌트의 어디서든 createNewEvent를 호출할 수 있다. 이때 매개변수를 넣어준다.

  mutate :
    fetch Post 요청을 원하는 시점에서 동작하도록 함
  onSuccess :
    요청이 진행중인 동안, 다른 작업 못하게 할 때 사용함.
    handleSubmit에서 navigate로 이동을하면 fetch가 끝나지도 않았는데, 페이지 이동이 발생함.
      fetch가 끝난 다음에 페이지 이동을 수행하기 위해서는 onSuccess가 필요해
      queryClient.invalidateQueries({ queryKey: ['events'] }) 호출하여 쿼리를 무효화한다.
        해당 코드는 useQuery에서 queryKey에 'events'가 포함된 모든 쿼리를 무효화하여 캐시된 데이터를 다시 갱신하여 가져온다.
  */

  const { mutate, isPending, isError, error } = useMutation({
    // mutationKey,
    mutationFn: createNewEvent,
    onSuccess: () => {
      // POST 요청이 성공적으로 끝나서 데이터 변형이 이루어지면 queryClient.invalidateQueries 호출
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    // 이때 mutate로 보내는 데이터의 형식은 서버에서 요구하는 형식을 맞춰야 한다.
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            'Failed to create event. Please Check your inputs and try again later.'
          }
        />
      )}
    </Modal>
  );
}
