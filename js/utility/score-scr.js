/**
 * Returns the Scored Results of a SCR Endpoint
 *
 * @param {String} scrEndpoint - The endpoint of the SCR that is to be scored
 * @param {Array of Objects} scrInput - An array of input objects for the SCR
 * @returns {Promise/Object of SCR} - Returns a Promise that should resolve into the scored results
 */
async function scoreSCR(scrEndpoint, scrInput) {
  let SCRSCORE = await fetch(
    scrEndpoint,
    {
      // mode: 'no-cors',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: scrInput,
      }),
      redirect: 'follow',
    }
  );
  if (!SCRSCORE.ok) {
    if (
      SCRSCORE.status === 403 &&
      SCRSCORE.headers.get('x-forbidden-reason') === 'CSRF'
    ) {
      let h = SCRSCORE.headers.get('x-csrf-header');
      let t = SCRSCORE.headers.get('x-csrf-token');
      document.csrfToken = t;
      SCRSCORE = await fetch(
        scrEndpoint,
        {
          // mode: 'no-cors',
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': t,
          },
          body: JSON.stringify({
            inputs: scrInput,
          }),
          redirect: 'follow',
        }
      );
    } else if (SCRSCORE.status === 400) {
      window.alert(await SCRSCORE.json());
    }
  }

  const SCRSCORECONTENT = await SCRSCORE.json();
  return SCRSCORECONTENT;
}
