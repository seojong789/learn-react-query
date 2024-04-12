import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient(); //QueryClient = Tanstack 쿼리에 필요한 일부 구성 객체

/*
NewEventsSection뿐만 아니라 FindEventSection에서도 사용할 수 있도록 수정
searchTerm의 값이 존재하지 않으면 newEventsSecion 존재하면 FindEventSection

useQuery에서 queryFn으로 아래 함수를 지정하면, useQuery는 지정된 함수에 query 객체를 보낸다.
객체 설명 (객체분해함)
  signal : 
    요청 취소 여부 (사용자가 요청 페이지를 벗어나면 리액트는 자동으로 요청을 취소함.)
    자동으로 요청 취소를 위해서는 fetch에 2번째 매개변수로 {signal:signal} 지정해야 함.

  max :
    backend

  최종적으로 fetchEvents의 url의 경우 
  fetchEvents를 호출할 때, searchTerm과 max가 각각 존재하는 지 여부에 따라서 url의 값이 바뀌게 된다.
*/
export async function fetchEvents({ signal, searchTerm, max }) {
  let url = 'http://localhost:3000/events'; // searchTerm, max

  if (searchTerm && max) {
    url += '?search=' + searchTerm + '&max=' + max;
  } else if (searchTerm) {
    url += '?search=' + searchTerm;
  } else if (max) {
    url += '?max=' + max;
  }

  const response = await fetch(url, { signal: signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the events');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}

// fetchEvents는 홈에서 모든 이벤트를 출력하기 위함
// fetchEvent는 이벤트 상세정보를 출력하기 위함
export async function fetchEvent({ id, signal }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    signal: signal,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();
  return event;
}

export async function createNewEvent(eventData) {
  const response = await fetch('http://localhost:3000/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = new Error('An error occured while creating the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();
  return event;
}

export async function fetchSelectableImages({ signal }) {
  const response = await fetch('http://localhost:3000/events/images', {
    signal,
  });

  if (!response.ok) {
    const error = new Error('An error occured while fetching the images');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { images } = await response.json();
  return images;
}

export async function deleteEvent({ id }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = new Error('An error occurred while deleting the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}

export async function updateEvent({ id, event }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
  });

  if (!response.ok) {
    const error = new Error('An error occured while updating the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}
