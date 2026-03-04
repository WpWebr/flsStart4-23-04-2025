<?php
	// Настройки отправки
	require 'config.php';
	
	// От кого письмо
	$mail->setFrom('codeonlybox@gmail.com', 'Фрілансер по життю'); // Указать нужный E-mail
	// Кому отправить
	$mail->addAddress('andrikanich@gmail.com'); // Указать нужный E-mail
	// Тема письма
	$mail->Subject = 'Привет! Новое письмо WP';

	// Тело письма
	$body = '<h1>Зустрічайте супер листа!</h1>';

	//if(trim(!empty($_POST['email']))){
		//$body.=$_POST['email'];
	//}	

	/*
	// Прикрепить файл
	if (!empty($_FILES['image']['tmp_name'])) {
		// путь загрузки файла
		$filePath = __DIR__ . "/files/sendmail/attachments/" . $_FILES['image']['name']; 
		// загружаем файл
		if (copy($_FILES['image']['tmp_name'], $filePath)){
			$fileAttach = $filePath;
			$body.='<p><strong>Фото у додатку</strong>';
			$mail->addAttachment($fileAttach);
		}
	}
	*/

	$mail->Body = $body;

	// Отправляем
	if (!$mail->send()) {
		$message = 'Помилка';
	} else {
		$message = 'Дані надіслані!';
	}

	$response = ['message' => $message];

	header('Content-type: application/json');
	echo json_encode($response);
?>
