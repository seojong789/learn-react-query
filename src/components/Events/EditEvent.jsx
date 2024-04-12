import {
  Link,
  useNavigate,
  useParams,
  redirect,
  useSubmit,
  useNavigation,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
// import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();
  const { state } = useNavigation(); // submit 수행 후, 전송이 완료되었는지 등을 확인하기 위한 훅

  // 맨 아래의 loader 함수로 인해 해당 useQuery 요청의 경우 캐시에 저장된 데이터를 가져옴 + isPending 삭제
  const { data, isError, error } = useQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal: signal }),
    staleTime: 10000,
  });
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   // onSuccess로 UI 업데이트 대신 낙관적 업데이트 사용
  //   /*
  //   낙관적 업데이트(onMutate)
  //   onMutate의 값에 해당하는 함수는 mutate를 호출하는 즉시 실행된다.
  //   즉, mutate 함수가 서버로 요청을 보내기 전에, 로컬 상태를 업데이트 한다. (캐시 데이터를 업데이트 수행)

  //   mutateData:
  //     mutate({ id: params.id, event: formData });를 통해 fetch 요청을 수행할 때,
  //     React Query에서 자동으로 { id: params.id, event: formData } 객체를 queryClient에게 보내준다.

  //   queryClient.cancelQueries({queryKey: ['events', {id:params.id}]}) :
  //     onMutate 이전에 요청된 쿼리(mutate)를 중단한다.
  //     fetch로 요청한 데이터와 낙관적 업데이트(setQueryData)의 충돌을 피하기 위함.
  //     장점 : 불필요한 리소스 소모를 막고 App 성능을 향상시키는 데 도움을 준다.

  //   queryClient.getQueryData :
  //     setQueryData가 실행될 때, updatedEvent의 값이 잘못된 경우 즉, error가 발생하면 다시 기존의 데이터로 롤백해야 한다.
  //     이를 위해서 setQueryData 실행 전에 getQueryData로 기존 캐시 데이터를 저장해야 한다.

  //   queryClient.setQueryData([], ):
  //     첫 번째 파라미터 :
  //       수정하고 싶은 데이터의 queryKey
  //     두 번째 파라미터 :
  //       변경하고 싶은 데이터 (캐시 데이터를 요청없이 handleSubmit의 formData로 변경해줌.)

  //   onError :
  //     낙관적 업데이트를 실패할 경우, 함수를 실행함.
  //     리액트 쿼리가 자동으로 error, mutateData, context 객체를 onError에 보내준다.
  //     context :
  //       onMutate의 return { previousEvent: prevEvent }에 해당한다.
  //       즉, 낙관적 업데이트가 실패하여 기존의 캐시 데이터로 롤백해야 할 경우 이를 getQueryData로 받았고 이를 이용해서 롤백한다.

  //   onSattled :
  //     낙관적 업데이트 성공/실패 여부와 상관없이 mutationFn이 끝나면 호출된다.
  //     queryClient.invalidateQueries() :
  //       백엔드의 데이터와 프론트엔드 데이터가 일치하는지 확인하기 위함
  //   */
  //   onMutate: async (mutateData) => {
  //     const updatedEvent = mutateData.event; // mutate의 formData에 해당함.

  //     await queryClient.cancelQueries({
  //       queryKey: ['events', { id: params.id }],
  //     });

  //     const prevEvent = queryClient.getQueryData();
  //     queryClient.setQueryData(['events', { id: params.id }], updatedEvent);

  //     return { previousEvent: prevEvent };
  //   },
  //   onError: (error, mutateData, context) => {
  //     queryClient.setQueryData(
  //       ['events', { id: params.id }],
  //       context.previousEvent
  //     );
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', { id: params.id }]);
  //   },
  // });

  function handleSubmit(formData) {
    // action 함수로 인해 낙관적 업데이트를 수행하지 않아서 주석 -> useSubmit 사용함.
    // mutate({ id: params.id, event: formData });
    // navigate('../');

    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  // loader를 사용하여 컴포넌트가 렌더링되기 전에 미리 데이터를 받기 떄문에, isPending이 필요가 없어짐.
  // if (isPending) {
  //   content = (
  //     <div className="center">
  //       <LoadingIndicator />
  //     </div>
  //   );
  // }

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
        {state === 'submitting' ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

/*
라우터 loader를 통해 query 사용하기(컴포넌트가 아니라서 훅 사용불가능.) -> queryClient.fetchQuery() 사용
useParams 사용 불가능 -> loader의 매개변수에 자동으로 request와 params가 전해짐.

아래 loader를 수행하면 컴포넌트 내부의 useQuery는 지워도 되느냐?
  loader에서 반환하는 Promise 객체를 useLoaderData로 받아서 사용해도 되지만, 
  해당 함수를 통해 HTTP 요청을 수행하면 컴포넌트가 렌더링 되기 전에 데이터를 요청해서 받아놓는다.
  이후, 위의 useQuery는 이미 응답을 받아서 저장된 캐시 데이터를 출력하게 된다.
  즉, 다른 창으로 이동했다가 다시 돌아오더라도 새로운 HTTP 요청이 아니라 캐시 데이터를 가져온다.

  다만, isPending의 경우 컴포넌트가 렌더링되기 전에 이미 데이터를 받기 때문에 필요가 없다.
*/
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', { id: params.id }],
    queryFn: ({ signal, queryKey }) =>
      fetchEvent({ signal: signal, ...queryKey[1] }),
  });
}

/*
라우터의 action 함수는 해당 페이지의 Form이 제출될 때, 리액트 라우터에 의해 트리거된다.

formData() :
  리액트 라우터에서 제공되는 내장 메소드로 전송된 데이터를 가져올 때 사용함.
    (EditEvent.jsx이므로 기존 내용을 수정하여 전송한다.)

Object.fromEntries(formData) :
  복잡한 형태의 formData 객체가 간단하게 key-value 쌍으로 변경된다.

updateEvent() :
  위의 컴포넌트 내부에서는 useMutation 훅을 사용하여 해당 함수를 호출했지만, 아래 action에서는 바로 호출이 가능함.

queryClient.invalidateQueries() :
  캐시 데이터 최신화 -> 위의 useMutation의 코드가 실행되지 않아서 낙관적 업데이트를 수행하지 않음.
  낙관적 업데이트를 위해서는 submit(useSubmit) 훅에서 자체 로직을 만들어야 함.
  invalidateQueries의 경우도 Promise를 반환하여 await가 필요함
*/
export async function action({ request, params }) {
  console.log('req', request);
  console.log('par', params);
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id: params.id, event: updatedEventData }); // http.js의 updateEvent 함수를 직접 호출
  await queryClient.invalidateQueries(['events']);

  return redirect('../');
}
