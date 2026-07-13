<script lang="ts">
// css
import "uno.css";

// types
import type { Snippet } from "svelte";

interface Props {
	children?: Snippet;
}
let { children }: Props = $props();
</script>

{@render children?.()}
