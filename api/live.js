export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.thaistock2d.com/live');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from source' });
  }
}
