const form = document.getElementById("memo-form");

// async function deleteMemo(event) {
//   const title = event.target.dataset.title;
//   const res = await fetch(`/memos/${title}`, {
//     method: "DELETE",
//   });
//   fetchList();
// }

const handleSubmitForm = async (event) => {
  event.preventDefault();

  const form = event.target;
  const titleInput = document.querySelector("#title");
  const contentInput = document.querySelector("#content");

  // 1. FormData 객체를 생성하여 폼의 모든 입력 필드 값을 자동으로 수집
  const body = new FormData(form);

  const res = await fetch("/memos", {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({
      message: "알 수 없는 오류",
    }));
    console.error(`메모 생성 실패! HTTP 상태: ${res.status}`, errorData);
    alert(`메모 생성 실패: ${errorData.message || res.statusText}`);
    return;
  }

  contentInput.value = "";
  if (titleInput) titleInput.value = "";

  fetchList();
};

const renderData = (data) => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "memo-item";

    div.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.content}</p>
        <small>작성 시간: ${item.createAt}</small>
        <hr>
    `;

    main.appendChild(div);
  });
};

const fetchList = async (sorted = "ASC", sortedBy = "createAt") => {
  const queryString = `?sorted=${sorted}&sortedBy=${sortedBy}`;
  const res = await fetch(`/memos${queryString}`);

  if (!res.ok) {
    console.log(`데이터 불러오기 실패: ${res.status}`);
    return;
  }

  try {
    const data = await res.json();
    renderData(data);
  } catch (e) {
    console.error("JSON 파싱 오류가 발생했습니다.", e);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (form) {
    form.addEventListener("submit", handleSubmitForm);
  }
  // 초기 메모 목록 로드
  fetchList("ASC", "createAt");
});
