<!-- auth : 토큰 발급을 위한 임시 페이지 -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import { authToken } from '../../../../service/store';
    import { page } from '$app/stores';

    import LoadingMessage from '../../../../components/Auth/LoadingMessage.svelte';

    const id = $page.params.id;
    let userInfo : UserDTO;

    let position = 80;

    onMount(async () => {
        // 스타워즈 스크롤 효과
        const interval = setInterval(() => {
            position -= 0.3;
        }, 40);

        // 30초 후에 로그인 및 리디렉션을 실행합니다.
        setTimeout(async () => {
            await authToken.login(id);
            goto('/main');
        }, 22000); // 30초를 밀리초로 환산합니다 (30 * 1000)

        // 컴포넌트가 unmount될 때 interval을 제거합니다.
        return () => clearInterval(interval);
    });

</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
	html, body, .container {
	  height: 100%;
	  margin: 0;
	  padding: 0;
	}

	.container {
	  perspective: 1000px;
	  overflow: hidden;
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}

	.text {
	  font-family: 'Jua', sans-serif;
	  transform-origin: 50% 100%;
	  transform-style: preserve-3d;
	  white-space: pre;
	  font-size: 16vmin;
	  text-align: center;
	  line-height: 3;
	  will-change: transform;
	}
  </style>

<div class="container">
	<div
	  class="text"
	  style={`transform: rotateX(30deg) translateY(${position}%)`}
	>
	:)
	저희 웹사이트를 방문해 주셔서 감사드립니다.
	우선, 이 사이트가 주는 이색적이고 독특한 경험에 당황하실 수도 있겠지만,
	이것이 바로 저희가 의도한 바입니다.
	저희의 디자인 철학이 이해가 가지 않는다면,
	이 글이 그 이유와 배경을 설명하는 데 도움이 되길 바랍니다.
	우리 인류의 예술은 매 시대마다 달랐습니다.
	석기시대에는 벽화와 동물 뼈를 활용한 예술이 있었습니다.
	이들은 당시 사람들이 신성하게 여긴
	생명력과 생존에 대한 이야기를 담고 있었습니다.
	이후 시대가 변하면서 인류의 예술도 달라졌습니다.
	중세시대에는 종교적인 테마와 상징이 두드러졌으며,
	고대 그리스에서는 인간의 완벽한 아름다움을 추구했습니다.
	이런 방식으로 인류의 문화는 계속 발전해 왔고,
	이를 통해 우리는 시대의 정신을 이해할 수 있습니다.
	그렇게 여러 시대를 거치며 우리는 포스트모더니즘 시대에 이르렀습니다.
	포스트모더니즘은 전통적인 가치와 체계를 해체하고,
	관점의 다양성을 중요시하며,
	기존의 패턴이나 논리를 부정합니다.
	저희 웹사이트의 디자인은 바로 이 포스트모더니즘적 접근법을 반영한 것입니다.

	21세기는 디지털 시대로,
	인터넷은 더 이상 단순한 정보 공유 수단이 아닙니다.
	이는 창조와 표현의 새로운 공간이 되었고,
	저희 웹사이트는 그 변화를 적극적으로 받아들여 디자인에 반영하였습니다.
	저희의 웹사이트 디자인은 기존의 웹 디자인이라는 틀을 깨트리고,
	이용자가 흔히 경험하는 사용성 패턴을 비꼬는 동시에,
	이용자 스스로의 창의적인 해석과 탐색을 요구합니다.

	당혹스러워하지 마시고, 저희 웹사이트를 자유롭게 탐험해 보세요.
	이는 여러분 스스로의 해석과 경험을 통해
	새로운 가치와 의미를 찾아가는 여정일 것입니다.
	여러분의 독특한 경험과 생각을 자유롭게 표현하고 공유하실 수 있기를 바랍니다.
	저희 웹사이트는 여러분이 그 주인공이고,
	여러분의 창의력을 통해 이 웹사이트는 새로운 의미를 지속적으로 부여받게 될 것입니다.

	감사합니다.
	</div>
</div>


