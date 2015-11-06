FlowRouter.route('/', {
  action(){BlazeLayout.render('main')}
})
FlowRouter.route('/admin', {
  action(){BlazeLayout.render('upload')}
})
