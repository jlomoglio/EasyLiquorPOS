export async function openCashDrawer() {
	try {
		if (window.electron?.openDrawer) {
			const result = await window.electron.openDrawer()
			console.log("🟢 Cash drawer opened:", result)
		} else {
			console.warn("⚠️ No openDrawer method available.")
		}
	} catch (err) {
		console.error("🔴 Failed to open cash drawer:", err)
	}
}
  