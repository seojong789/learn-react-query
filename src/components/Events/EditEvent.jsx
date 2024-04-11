import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal: signal }),
  });
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // onSuccess로 UI 업데이트 대신 낙관적 업데이트 사용
    /* 
    낙관적 업데이트(onMutate)
    onMutate의 값에 해당하는 함수는 mutate를 호출하는 즉시 실행된다.
    즉, mutate 함수가 서버로 요청을 보내기 전에, 로컬 상태를 업데이트 한다. (캐시 데이터를 업데이트 수행)

    mutateData:
      mutate({ id: params.id, event: formData });를 통해 fetch 요청을 수행할 때, 
      React Query에서 자동으로 { id: params.id, event: formData } 객체를 queryClient에게 보내준다.

    queryClient.cancelQueries({queryKey: ['events', {id:params.id}]}) :
      onMutate 이전에 요청된 쿼리(mutate)를 중단한다.
      fetch로 요청한 데이터와 낙관적 업데이트(setQueryData)의 충돌을 피하기 위함. 
      장점 : 불필요한 리소스 소모를 막고 App 성능을 향상시키는 데 도움을 준다.

    queryClient.getQueryData :
      setQueryData가 실행될 때, updatedEvent의 값이 잘못된 경우 즉, error가 발생하면 다시 기존의 데이터로 롤백해야 한다. 
      이를 위해서 setQueryData 실행 전에 getQueryData로 기존 캐시 데이터를 저장해야 한다.

    queryClient.setQueryData([], ):
      첫 번째 파라미터 :
        수정하고 싶은 데이터의 queryKey
      두 번째 파라미터 :
        변경하고 싶은 데이터 (캐시 데이터를 요청없이 handleSubmit의 formData로 변경해줌.)
    
    onError :
      낙관적 업데이트를 실패할 경우, 함수를 실행함.
      리액트 쿼리가 자동으로 error, mutateData, context 객체를 onError에 보내준다.
      context :
        onMutate의 return { previousEvent: prevEvent }에 해당한다.
        즉, 낙관적 업데이트가 실패하여 기존의 캐시 데이터로 롤백해야 할 경우 이를 getQueryData로 받았고 이를 이용해서 롤백한다.
    
    onSattled :
      낙관적 업데이트 성공/실패 여부와 상관없이 mutationFn이 끝나면 호출된다.
      queryClient.invalidateQueries() : 
        백엔드의 데이터와 프론트엔드 데이터가 일치하는지 확인하기 위함
    */
    onMutate: async (mutateData) => {
      const updatedEvent = mutateData.event; // mutate의 formData에 해당함.

      await queryClient.cancelQueries({
        queryKey: ['events', { id: params.id }],
      });

      const prevEvent = queryClient.getQueryData();
      queryClient.setQueryData(['events', { id: params.id }], updatedEvent);

      return { previousEvent: prevEvent };
    },
    onError: (error, mutateData, context) => {
      queryClient.setQueryData(
        ['events', { id: params.id }],
        context.previousEvent
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', { id: params.id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            'Failed to load event. Please check your inputs and try again later.'
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
